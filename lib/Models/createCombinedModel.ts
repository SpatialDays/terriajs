import ModelTraits, { TraitDefinitions } from "../Traits/ModelTraits";
import Model, { BaseModel } from "./Model";
import DeveloperError from "terriajs-cesium/Source/Core/DeveloperError";
import traitsClassToModelClass from "../Traits/traitsClassToModelClass";
import StratumFromTraits from "./StratumFromTraits";
import createStratumInstance from "./createStratumInstance";
import { decorate, computed } from "mobx";
import TraitsConstructor from "../Traits/TraitsConstructor";
import { ObjectArrayTrait } from "../Traits/objectArrayTrait";
import { ObjectTrait } from "../Traits/objectTrait";

/**
 * Creates a model by combining two other models in the usual
 * strata fashion. If the model's strata are modified, only the
 * `top` model is affected. The two models must have the same
 * {@link Model#TraitsClass}.
 * @param top The top model to combine.
 * @param bottom The bottom model to combine.
 * @returns The combined model.
 */
export default function createCombinedModel<T extends ModelTraits>(
  top: Model<T>,
  bottom: Model<T>
): Model<T> {
  if (top.TraitsClass !== bottom.TraitsClass) {
    throw new DeveloperError(
      "The two models in createCombinedModel must have the same TraitsClass."
    );
  }

  const strata = new CombinedStrata<T>(top, bottom);
  const ModelClass = traitsClassToModelClass(top.TraitsClass);
  return new ModelClass(undefined, top.terria, strata);
}

class CombinedStrata<T extends ModelTraits>
  implements Map<string, StratumFromTraits<T>> {
  constructor(readonly top: Model<T>, readonly bottom: Model<T>) {}

  clear(): void {
    this.top.strata.clear();
  }
  delete(key: string): boolean {
    return this.top.strata.delete(key);
  }
  forEach(
    callbackfn: (
      value: StratumFromTraits<T>,
      key: string,
      map: Map<string, StratumFromTraits<T>>
    ) => void,
    thisArg?: any
  ): void {
    this.strata.forEach((value: any, key: string) => {
      callbackfn.call(thisArg, value, key, this);
    });
  }
  get(key: string): StratumFromTraits<T> | undefined {
    return this.strata.get(key);
  }
  has(key: string): boolean {
    return this.strata.has(key);
  }
  set(key: string, value: StratumFromTraits<T>): this {
    this.top.strata.set(key, value);
    return this;
  }
  get size(): number {
    return this.strata.size;
  }
  [Symbol.iterator](): IterableIterator<[string, StratumFromTraits<T>]> {
    return this.strata.entries();
  }
  entries(): IterableIterator<[string, StratumFromTraits<T>]> {
    return this.strata.entries();
  }
  keys(): IterableIterator<string> {
    return this.strata.keys();
  }
  values(): IterableIterator<StratumFromTraits<T>> {
    return this.strata.values();
  }
  get [Symbol.toStringTag](): string {
    return this.strata.toString();
  }

  @computed
  private get strata(): ReadonlyMap<string, StratumFromTraits<T>> {
    const result = new Map<string, StratumFromTraits<T>>();

    // Add the strata fro the top
    for (let key of this.top.strata.keys()) {
      const topStratum = this.top.strata.get(key);
      const bottomStratum = this.bottom.strata.get(key);

      if (topStratum !== undefined && bottomStratum !== undefined) {
        result.set(
          key,
          createCombinedStratum(this.top.TraitsClass, topStratum, bottomStratum)
        );
      } else if (topStratum !== undefined) {
        result.set(key, topStratum);
      } else if (bottomStratum !== undefined) {
        const newTopStratum = createStratumInstance(this.top.TraitsClass);
        this.top.strata.set(key, newTopStratum);

        result.set(
          key,
          createCombinedStratum(
            this.top.TraitsClass,
            newTopStratum,
            bottomStratum
          )
        );
      }
    }

    // Add any strata that are only in the bottom
    for (let key of this.bottom.strata.keys()) {
      if (this.top.strata.has(key)) {
        continue;
      }

      const bottomStratum = this.bottom.strata.get(key);
      if (bottomStratum === undefined) {
        continue;
      }

      result.set(key, bottomStratum);
    }

    return result;
  }
}

function createCombinedStratum<T extends ModelTraits>(
  TraitsClass: TraitsConstructor<T>,
  top: StratumFromTraits<T>,
  bottom: StratumFromTraits<T>
): StratumFromTraits<T> {
  const strata = new Map<string, StratumFromTraits<T>>([
    ["top", top],
    ["bottom", bottom]
  ]);

  const result = {
    strata: strata,
    strataTopToBottom: strata,
    TraitsClass: TraitsClass
  };

  const traits = TraitsClass.traits;
  const decorators: { [id: string]: PropertyDecorator } = {};

  Object.keys(traits).forEach(traitName => {
    const trait = traits[traitName];
    Object.defineProperty(result, traitName, {
      get: function() {
        const traitValue = trait.getValue(this);

        // The value may be a model (from ObjectTrait) or an array of models
        // (from ObjectArrayTrait). In either case the models will have two
        // strata named "top" and "bottom" because they will use
        // `NestedStrataMap` or `ArrayNestedStrataMap`. But we don't want
        // models because models have defaults. So instead extract the
        // two strata and call `createCombinedStratum` with them.
        if (traitValue instanceof BaseModel) {
          return unwrapCombinedStratumFromModel(traitValue);
        } else if (Array.isArray(traitValue)) {
          return traitValue.map(item => {
            if (item instanceof BaseModel) {
              return unwrapCombinedStratumFromModel(item);
            } else {
              return item;
            }
          });
        }

        return traitValue;
      },
      set: function(value) {
        (<any>top)[traitName] = value;
      },
      enumerable: true,
      configurable: true
    });

    decorators[traitName] = trait.decoratorForFlattened || computed;
  });

  decorate(result, decorators);

  return <StratumFromTraits<T>>(<unknown>result);
}

function unwrapCombinedStratumFromModel(value: BaseModel) {
  const nestedTop = value.strata.get("top");
  const nestedBottom = value.strata.get("bottom");
  if (nestedTop !== undefined && nestedBottom !== undefined) {
    return createCombinedStratum(value.TraitsClass, nestedTop, nestedBottom);
  } else if (nestedTop !== undefined) {
    return nestedTop;
  } else {
    return nestedBottom;
  }
}

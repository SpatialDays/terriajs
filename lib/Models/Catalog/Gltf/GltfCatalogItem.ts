import { action, computed, observable, makeObservable } from "mobx";
import GltfMixin from "../../../ModelMixins/GltfMixin";
import UrlMixin from "../../../ModelMixins/UrlMixin";
import GltfCatalogItemTraits from "../../../Traits/TraitsClasses/GltfCatalogItemTraits";
import CommonStrata from "../../Definition/CommonStrata";
import CreateModel from "../../Definition/CreateModel";
import HasLocalData from "../../HasLocalData";

export default class GltfCatalogItem
  extends UrlMixin(GltfMixin(CreateModel(GltfCatalogItemTraits)))
  implements HasLocalData
{
  static readonly type = "gltf";

  constructor() {
    // TODO: [mobx-undecorate] verify the constructor arguments and the arguments of this automatically generated super call
    super();

    makeObservable(this);
  }

  get type() {
    return GltfCatalogItem.type;
  }

  @computed
  get gltfModelUrl() {
    return this.url;
  }

  @observable hasLocalData = false;

  @action
  setFileInput(file: File | Blob) {
    const dataUrl = URL.createObjectURL(file);
    this.setTrait(CommonStrata.user, "url", dataUrl);
    this.hasLocalData = true;
  }
}

import ModelTraits from "../ModelTraits";
import primitiveTrait from "../Decorators/primitiveTrait";
import { Quaternion as Quaternion } from "cesium";
import { HeadingPitchRoll as HeadingPitchRoll } from "cesium";
import updateModelFromJson from "../../Models/Definition/updateModelFromJson";
import { Matrix3 as Matrix3 } from "cesium";
import { Math as CesiumMath } from "cesium";
import Model from "../../Models/Definition/Model";

// Scratch variables used to avoid repeated object instantiation
const hprScratch = new HeadingPitchRoll();
const quaternionScratch = new Quaternion();

export default class HeadingPitchRollTraits extends ModelTraits {
  @primitiveTrait({
    type: "number",
    name: "Heading",
    description: "Heading in degrees"
  })
  heading?: number;

  @primitiveTrait({
    type: "number",
    name: "Pitch",
    description: "Pitch in degrees"
  })
  pitch?: number;

  @primitiveTrait({
    type: "number",
    name: "Roll",
    description: "Roll in degrees"
  })
  roll?: number;

  static setFromRotationMatrix(
    model: Model<HeadingPitchRollTraits>,
    stratumId: string,
    rotation: Matrix3
  ) {
    this.setFromHeadingPitchRoll(
      model,
      stratumId,
      HeadingPitchRoll.fromQuaternion(
        Quaternion.fromRotationMatrix(rotation, quaternionScratch),
        hprScratch
      )
    );
  }

  static setFromQuaternion(
    model: Model<HeadingPitchRollTraits>,
    stratumId: string,
    rotation: Quaternion
  ) {
    this.setFromHeadingPitchRoll(
      model,
      stratumId,
      HeadingPitchRoll.fromQuaternion(rotation, hprScratch)
    );
  }

  static setFromHeadingPitchRoll(
    model: Model<HeadingPitchRollTraits>,
    stratumId: string,
    hpr: HeadingPitchRoll
  ) {
    updateModelFromJson(model, stratumId, {
      heading: CesiumMath.toDegrees(hpr.heading),
      pitch: CesiumMath.toDegrees(hpr.pitch),
      roll: CesiumMath.toDegrees(hpr.roll)
    }).logError("Error ocurred while setting heading, pitch and roll");
  }
}

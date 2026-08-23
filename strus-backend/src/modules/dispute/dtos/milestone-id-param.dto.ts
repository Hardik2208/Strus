import type { ParamsDictionary } from "express-serve-static-core";

export interface MilestoneIdParamDto
  extends ParamsDictionary {

  milestoneId: string;

}
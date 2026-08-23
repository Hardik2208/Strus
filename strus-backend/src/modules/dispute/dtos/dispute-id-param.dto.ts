import type { ParamsDictionary } from "express-serve-static-core";

export interface DisputeIdParamDto
  extends ParamsDictionary {

  disputeId: string;

}
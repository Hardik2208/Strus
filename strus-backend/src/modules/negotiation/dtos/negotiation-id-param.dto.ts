import type {
  ParamsDictionary,
} from "express-serve-static-core";

export interface NegotiationIdParamDto
  extends ParamsDictionary {

  negotiationId: string;

}
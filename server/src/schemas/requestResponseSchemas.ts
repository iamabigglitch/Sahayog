import { z } from "zod";

import { ResponseStatus } from "../types/enums";


export const createRequestResponseSchema = z.object({

  requestId: z
    .string()
    .uuid("Request ID must be a valid UUID"),

});


export const updateRequestResponseSchema = z.object({

  status: z.enum([
    ResponseStatus.ACCEPTED,
    ResponseStatus.DECLINED,
  ]),

});
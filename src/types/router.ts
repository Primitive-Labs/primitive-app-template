import "vue-router";
import type { PrimitiveRouterMeta } from "../router/primitiveRouter";

declare module "vue-router" {
  interface RouteMeta {
    /**
     * App-specific routing metadata. Required on every route.
     * See `primitiveRouter.ts` for the shape.
     */
    primitiveRouterMeta: PrimitiveRouterMeta;
  }
}

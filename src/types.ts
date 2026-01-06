import { EventHandler } from "@create-figma-plugin/utilities";

export interface PageInfo {
  id: string;
  name: string;
}

export interface PackPagesHandler extends EventHandler {
  name: "PACK_PAGES";
  handler: (pageIds: string[]) => void;
}

export interface UnpackPagesHandler extends EventHandler {
  name: "UNPACK_PAGES";
  handler: () => void;
}

export interface FindBoundVariablesHandler extends EventHandler {
  name: "FIND_BOUND_VARIABLES";
  handler: () => void;
}

export interface CloseHandler extends EventHandler {
  name: "CLOSE";
  handler: () => void;
}

export interface OperationCompleteHandler extends EventHandler {
  name: "OPERATION_COMPLETE";
  handler: () => void;
}

export interface GetPagesHandler extends EventHandler {
  name: "GET_PAGES";
  handler: () => void;
}

export interface PagesListHandler extends EventHandler {
  name: "PAGES_LIST";
  handler: (pages: PageInfo[]) => void;
}

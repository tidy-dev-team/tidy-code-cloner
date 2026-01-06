import {
  Button,
  Container,
  LoadingIndicator,
  render,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

import {
  FindBoundVariablesHandler,
  OperationCompleteHandler,
  PackPagesHandler,
  UnpackPagesHandler,
} from "./types";

function Plugin() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    on<OperationCompleteHandler>("OPERATION_COMPLETE", () => {
      setLoading(false);
      setLoadingMessage("");
    });
  }, []);

  const handlePackPagesButtonClick = useCallback(function () {
    setLoading(true);
    setLoadingMessage("Packing pages...");
    emit<PackPagesHandler>("PACK_PAGES");
  }, []);

  const handleUnpackPagesButtonClick = useCallback(function () {
    setLoading(true);
    setLoadingMessage("Unpacking pages...");
    emit<UnpackPagesHandler>("UNPACK_PAGES");
  }, []);

  const handleFindBoundVariablesButtonClick = useCallback(function () {
    setLoading(true);
    setLoadingMessage("Scanning for variables...");
    emit<FindBoundVariablesHandler>("FIND_BOUND_VARIABLES");
  }, []);

  if (loading) {
    return (
      <Container space="medium">
        <VerticalSpace space="extraLarge" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <LoadingIndicator />
          <Text
            align="center"
            style={{ color: "var(--figma-color-text-secondary)" }}
          >
            {loadingMessage}
          </Text>
        </div>
        <VerticalSpace space="extraLarge" />
      </Container>
    );
  }

  return (
    <Container space="medium">
      <VerticalSpace space="extraLarge" />
      <Button fullWidth onClick={handlePackPagesButtonClick}>
        Pack Pages ↓
      </Button>
      <VerticalSpace space="medium" />
      <hr
        style={{ border: "none", borderTop: "1px solid #ccc", margin: "0" }}
      />
      <VerticalSpace space="medium" />
      <Button fullWidth onClick={handleFindBoundVariablesButtonClick}>
        Find bound variables
      </Button>
      <VerticalSpace space="medium" />
      <hr
        style={{ border: "none", borderTop: "1px solid #ccc", margin: "0" }}
      />
      <VerticalSpace space="medium" />
      <Button fullWidth onClick={handleUnpackPagesButtonClick}>
        Unpack Pages ↑
      </Button>
      <VerticalSpace space="large" />
    </Container>
  );
}

export default render(Plugin);

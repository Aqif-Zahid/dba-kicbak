import { parseAsBoolean, useQueryState } from "nuqs";
export const useSigninModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "signin",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
};

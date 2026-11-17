import { useEffect, useRef } from "react";
import { imageSource } from "../archiveData";
export default function ArchiveImage({
  image,
  onClose,
}: {
  image: string | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (image) {
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [image]);
  return (
    <dialog
      className="ib-image-dialog"
      ref={dialog}
      onCancel={onClose}
      onClose={() => {
        if (image) onClose();
      }}
    >
      <button autoFocus onClick={onClose}>
        Закрыть изображение [×]
      </button>
      {image && (
        <img
          src={imageSource(image)}
          alt="Увеличенная авторская архивная иллюстрация"
        />
      )}
      <p>LOCAL ILLUSTRATION / RECOVERED FRAME</p>
    </dialog>
  );
}

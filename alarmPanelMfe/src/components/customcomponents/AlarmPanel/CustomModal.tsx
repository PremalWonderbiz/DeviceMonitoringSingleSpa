import React, { useRef, useState } from "react";
import * as styles from "@/styles/scss/AlarmPanel.module.scss";

const CustomModal = ({
  isOpen,
  setIsOpen,
  title,
  footer = true,
  actionFunction = () => {},
}: any) => {  
  const [tempAlarmComment, setTempAlarmComment] = useState<string>("");
  const commentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changeAlarmComment = async (value: string) => {
    if (commentTimeoutRef.current) {
      clearTimeout(commentTimeoutRef.current);
    }

    if (value === "") {
      setTempAlarmComment("");
      return;
    }

    commentTimeoutRef.current = setTimeout(async () => {
      setTempAlarmComment(value);
    }, 200);
  };

  const handleClose = () => setIsOpen(false);

  const handleSave = () => {
    if(tempAlarmComment === "") {
      return;
    }
    actionFunction(tempAlarmComment);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.customModalWrapper} onClick={(e: any) => e.stopPropagation()}>
      <button className={styles.closeBtn} onClick={handleClose}>×</button>
      <h3 className={styles.modalTitle}>{title}</h3>
      <div className={styles.commentInputWrapper}>
        <textarea
          defaultValue={""}
          onChange={(event: any) => changeAlarmComment(event.target.value)}
          className={styles.resolveCommentInput}
          placeholder="Comment"
          maxLength={255}
          rows={2}
        />
      </div>
      {footer && (
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  );
};

export default CustomModal;

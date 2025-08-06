import { useEffect, useRef, useState } from "react";
import { FilePenLine, ShieldCheck, ShieldEllipsis } from "lucide-react";
import * as styles from "@/styles/scss/AlarmPanel.module.scss";
import CustomModal from "./CustomModal";
import { formatRelativeTime } from "@/utils/helperfunctions";
import Badge from "../Badge";
import { Tooltip } from "@/components/ui/tooltip";

const severityColors: Record<string, { bg: string; color: string }> = {
    Critical: { bg: 'criticalAlarm', color: 'light' },
    Warning: { bg: 'warningAlarm', color: 'dark' },
    Information: { bg: 'infoAlarm', color: 'light' },
};

const AlarmCard = ({ removeacknowledgedAlarm, removeunacknowledgedAlarm, alarm, investigateAlarm, resolveAlarm, currentExpandedAckAlarm, setCurrentExpandedAckAlarm, currentExpandedUnackAlarm, setCurrentExpandedUnackAlarm, resolveInvestigatedAlarmData }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isResolveCommentModalOpen, setIsResolveCommentModalOpen] = useState(false);
    const [alarmComment, setAlarmComment] = useState<string>("");

    useEffect(() => {
        if (alarm.isAcknowledged) {
            if (currentExpandedAckAlarm != "") {
                if (currentExpandedAckAlarm == alarm.id) {
                    setIsExpanded(true);
                    setIsResolveCommentModalOpen(false);
                }
                else {
                    setIsExpanded(false);
                    setIsResolveCommentModalOpen(false);
                }
            }
            else {
                setIsExpanded(false);
                setIsResolveCommentModalOpen(false);
            }
        }
        else if (currentExpandedUnackAlarm != "") {
            if (currentExpandedUnackAlarm == alarm.id) {
                setIsExpanded(true);
                setIsResolveCommentModalOpen(false);
            }
            else {
                setIsExpanded(false);
                setIsResolveCommentModalOpen(false);
            }
        }
        else {
            setIsExpanded(false);
            setIsResolveCommentModalOpen(false);
        }

    }, [currentExpandedAckAlarm, currentExpandedUnackAlarm]);

    const expandOrCollapseAlarm = () => {
        if (alarm.isAcknowledged) {
            currentExpandedAckAlarm == alarm.id ? setCurrentExpandedAckAlarm("") : setCurrentExpandedAckAlarm(alarm.id);
        }
        else {
            currentExpandedUnackAlarm == alarm.id ? setCurrentExpandedUnackAlarm("") : setCurrentExpandedUnackAlarm(alarm.id);
        }
    }

    const resolveInvestigatedAlarm = () => {
        if (alarmComment == "")
            setIsResolveCommentModalOpen(true);
        else
            resolveInvestigatedAlarmData(alarm.id, alarmComment)
    }

    const ignoreInvestigatedAlarm = () => {
        if (alarmComment == "")
            setIsResolveCommentModalOpen(true);
        else
            removeacknowledgedAlarm(alarm.id, alarmComment);
    }


    return (
        <div className={`${styles.alarmCardContainer} ${isExpanded ? styles.expanded : ''} ${alarm.isAcknowledged && (alarm.alarmState == "Resolved" ? styles.resolvedAlarmCard : '')}`} onClick={() => { expandOrCollapseAlarm() }} >
            <CustomModal
                setAlarmComment={setAlarmComment}
                title={"Add comment"}
                isOpen={isResolveCommentModalOpen}
                setIsOpen={setIsResolveCommentModalOpen}
                defaultComment={alarmComment}
            />

            {alarm.isAcknowledged && (
                alarm.alarmState == "Investigating" ?
                    <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>{alarm.alarmComment}</span>}>
                        <ShieldEllipsis size={15} className={`${styles.ackAlarmStateIcon} ${styles.ackAlarmStateInvestigateIcon}`} />
                    </Tooltip>
                    :
                    <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>{alarm.alarmComment}</span>}>
                        <ShieldCheck size={15} className={`${styles.ackAlarmStateIcon} ${styles.ackAlarmStateResolveIcon}`} />
                    </Tooltip>
            )}

            <div className={styles.alarmCardDiv}>
                <div>
                    <p className={styles.message}>{alarm.message}</p>
                    <span className={styles.time}>{formatRelativeTime(alarm.raisedAt)}</span>
                    {(alarm.isAcknowledged && alarm.alarmState == "Resolved") && <span className={styles.alarmComment}>{alarm.acknowledgedFrom}</span>}
                </div>
                <div className={styles.rightSide}>
                    <Badge
                        label={alarm.severity}
                        bgColor={severityColors[alarm.severity].bg}
                        textColor={severityColors[alarm.severity].color}
                    />
                </div>
            </div>

            {!alarm.isAcknowledged &&
                <div className={`${styles.expandedContent} ${isExpanded ? styles.show : ""}`}>
                    <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Mark as Investigating</span>}>
                        <button onClick={(event) => {
                            event.stopPropagation();
                            investigateAlarm(alarm.id);
                        }}
                            className={styles.ackBtn}
                        >
                            Investigate
                        </button>
                    </Tooltip>

                    <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Mark as Resolved</span>}>
                        <button
                            onClick={(event) => { event.stopPropagation(); resolveAlarm(alarm.id, alarmComment) }}
                            className={`${styles.ackBtn} ${styles.resolveBtn}`}
                        >
                            Resolve
                            <Tooltip openDelay={100} closeDelay={150} content={<span>Add comment (Optional)</span>} isLazy>
                                <span>
                                    <FilePenLine
                                        size={20}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsResolveCommentModalOpen(true);
                                        }}
                                        className={styles.resolveCommentIcon}
                                    />
                                </span>
                            </Tooltip>
                        </button>
                    </Tooltip>

                    <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Ignore Alarm</span>}>
                        <button
                            onClick={(event) => { event.stopPropagation(); removeunacknowledgedAlarm(alarm.id, alarmComment) }}
                            className={`${styles.ackBtn} ${styles.ignoreBtn}`}
                        >
                            Ignore
                            <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Add comment (Optional)</span>}>
                                <span>
                                    <FilePenLine
                                        size={20}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsResolveCommentModalOpen(true);
                                        }}
                                        className={styles.resolveCommentIcon}
                                    />
                                </span>
                            </Tooltip>
                        </button>
                    </Tooltip>
                </div>}

            {(alarm.isAcknowledged && alarm.alarmState == "Investigating") &&
                <div className={`${styles.expandedContent} ${isExpanded ? styles.show : ""}`}>
                    <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Mark as Resolved</span>}>
                        <button
                            onClick={(event) => { event.stopPropagation(); resolveInvestigatedAlarm(); }}
                            className={`${styles.ackBtn} ${styles.resolveBtn}`}>
                            Resolve
                            <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Add comment (Mandatory)</span>}>
                            <span>
                                <FilePenLine
                                    size={20}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsResolveCommentModalOpen(true);
                                    }}
                                    className={styles.resolveCommentIcon}
                                />
                            </span>
                            </Tooltip>
                        </button>
                    </Tooltip>

                    <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Ignore Alarm</span>}>
                        <button
                            onClick={(event) => { event.stopPropagation(); ignoreInvestigatedAlarm(); }}
                            className={`${styles.ackBtn} ${styles.ignoreBtn}`}
                        >
                            Ignore
                            <Tooltip isLazy openDelay={100} closeDelay={150} content={<span>Add comment (Mandatory)</span>}>
                            <span>
                                <FilePenLine
                                    size={20}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsResolveCommentModalOpen(true);
                                    }}
                                    className={styles.resolveCommentIcon}
                                />
                            </span>
                            </Tooltip>
                        </button>
                    </Tooltip>
                </div>}
        </div>
    );
};

export default AlarmCard;

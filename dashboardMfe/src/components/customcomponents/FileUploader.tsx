import React, { useRef, useState } from 'react';
import * as styles from "@/styles/scss/FileUploader.module.scss";
import { Info, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { uploadFile } from '@/services/deviceservice';
import { Tooltip } from '@/components/ui/tooltip';

// import { Tooltip } from '../ui/tooltip';

const FileUploader = (props: any) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>("");    

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === "application/json") {
                setFile(selectedFile);
                setError("");
            } else {
                setFile(null);
                setError("Only .json files are allowed.");
            }
        }

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleClear = () => {
        setFile(null);
        setError("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleSubmit = () => {
        if (file) {
            console.log("Submitting file:", file);
            uploadFileToDisk();
        }
    };

    const uploadFileToDisk = async () => {
        const response = await uploadFile(file!);
        if (response && response.data) {
            setFile(null);
            notify(response.data.message, "success");
            props.setRefreshDeviceDataKey((prev: any) => prev + 1); // Trigger a refresh in parent component
            props.setHardRefreshDeviceDataKey((prev: any) => prev + 1); // Trigger a hard refresh in parent component
        } else {
            notify(response.response?.data??"Server unreachable", "error");
        }
    };

    const notify = (msg: string, type: any) => toast(msg, {
        pauseOnHover: true,
        autoClose: 3000,
        theme: "light",
        position: "top-right",
        closeButton: true,
        type: type,
    });

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "/template.json"; // file in public folder
        link.download = "template.json"; // optional: enforce download instead of opening
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.fileUpload}>
            <ToastContainer />
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                className={styles.fileInput}
                accept=".json"
            />
            <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">Upload new device json file</span>}>
                <button onClick={handleButtonClick} className={styles.uploadButton}>
                    Upload File
                </button>
            </Tooltip>

            <div className={styles.fileInfo}>
                {file ? (
                    <>
                        <span className={styles.fileName}>Selected: {file.name} </span>
                        <X className={styles.clearIcon} onClick={handleClear} />
                        <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">Add {file.name}</span>}>
                            <button className={styles.submitButton} onClick={handleSubmit}>
                                Submit
                            </button>
                        </Tooltip>
                    </>
                ) : (
                    <span className={styles.noFile}>No file selected
                        <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">Download a template</span>}>
                            <Info onClick={() => {handleDownload()}} className={styles.infoIcon} size={15} />
                        </Tooltip>
                    </span>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default FileUploader;

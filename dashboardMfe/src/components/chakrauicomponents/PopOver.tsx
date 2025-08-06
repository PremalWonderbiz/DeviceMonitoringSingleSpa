import { Button, Popover, Portal } from "@chakra-ui/react"
import { useEffect, useState } from "react";

const PopOver = ({ children, isOpen , triggerContent, shouldOpen = true }: any) => {
    const [isPopOverOpen, setIsPopOverOpen] = useState(isOpen);

    useEffect(() => {
        setIsPopOverOpen(isOpen);
    },[isOpen]);

    return (
        <Popover.Root open={isOpen} positioning={{ placement: "bottom-end" }}>
            <Popover.Trigger asChild>
                {triggerContent ? triggerContent : <Button variant="outline">Open PopOver</Button>}
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    {shouldOpen &&
                    <Popover.Content css={{ "--popover-bg": "#fff" }} >
                        <Popover.Arrow  />
                        <Popover.Body onMouseEnter={() => setIsPopOverOpen(true)} onMouseLeave={() => {setIsPopOverOpen(false)}}>
                            {children}
                        </Popover.Body>
                    </Popover.Content>}
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    )
}

export default PopOver;
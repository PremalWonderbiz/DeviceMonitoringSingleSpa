import { Badge, CloseButton, Combobox, Portal, Wrap, createListCollection} from "@chakra-ui/react"
import { useMemo, useState } from "react"

const SelectDevicesComboBox = ({ devices, selectedDevices, setSelectedDevices, multiple = true }: any) => {
  const [searchValue, setSearchValue] = useState("")
 
  // Filter devices based on search input
  const filteredItems = useMemo(
    () =>
      devices.filter((item: any) =>
        item.deviceName.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue, devices]
  )

  // Prepare collection for Combobox from filtered list
  const collection = useMemo(
    () =>
      createListCollection({
        items: filteredItems.map((device: any) => ({
          value: device.deviceMacId,
          label: device.deviceName,
        })),
      }),
    [filteredItems]
  )
  
  // Convert selected objects to their macIds
  const selectedMacIds = useMemo(
    () => selectedDevices.map((d: any) => d.deviceMacId),
    [selectedDevices]
  )

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    const newSelected = details.value
      .map((macId: string) => devices.find((d: any) => d.deviceMacId === macId))
      .filter(Boolean)
    setSelectedDevices(newSelected)
  }

  return (
    <Combobox.Root
      multiple={multiple}
      // width="320px"
      value={selectedMacIds}
      collection={collection}
      onValueChange={handleValueChange}
      onInputValueChange={(details) => setSearchValue(details.inputValue)}
    >
      <Wrap gap="2">
        {selectedDevices.map((device: any) => (
          <Badge
            key={device.deviceMacId}
            padding="0.25rem 0 0.25rem 0.4rem"
            display="flex"
            alignItems="center"
            gap="0.3rem"
            fontSize={"0.7rem"}
          >
            {device.deviceName}
            <CloseButton
              size={"sm"}
              boxSize="0.1em"
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDevices(
                  selectedDevices.filter(
                    (d: any) => d.deviceMacId !== device.deviceMacId
                  )
                )
              }}
            />
          </Badge>
        ))}
      </Wrap>

      <Combobox.Control>
        <Combobox.Input borderRadius={"5px"} focusRing="none" border={"1px solid black"} _placeholder={{ color : "#252525" }} placeholder="Select Devices" padding="0.5rem 0.5rem" />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger padding="0.5rem" />
        </Combobox.IndicatorGroup>
      </Combobox.Control>

      <Portal>
        <Combobox.Positioner>
          <Combobox.Content
            backgroundColor="#fff"
            color="#000"
            padding="0.5rem 0rem"
            zIndex="popover"
          >
            <Combobox.ItemGroup>
              <Combobox.ItemGroupLabel padding={"0rem 1rem"} fontWeight={"bold"}>Devices</Combobox.ItemGroupLabel>

              {filteredItems.map((item: any) => (
                <Combobox.Item
                  padding={"0.1rem 1rem"}
                  _hover={{ backgroundColor: "#e6e6e6ff" }}
                  key={item.deviceMacId}
                  item={item.deviceMacId}
                >
                  {item.deviceName}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}

              {filteredItems.length === 0 && (
                <Combobox.Empty>No devices found</Combobox.Empty>
              )}
            </Combobox.ItemGroup>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}

export default SelectDevicesComboBox

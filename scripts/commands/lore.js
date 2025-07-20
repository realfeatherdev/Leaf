import commandManager from "../api/commands/commandManager";

commandManager.addCommand("lore", {description: "Set the lore of an item"}, ({msg, args})=>{
    let loreText = args.join(' ').split('\\n')
    let inventory = msg.sender.getComponent('inventory');
    let container = inventory.container;
    if(!container.getItem(msg.sender.selectedSlotIndex)) return msg.sender.error(`You need to hold an item`)
    let item = container.getItem(msg.sender.selectedSlotIndex)
    item.setLore(loreText)
    container.setItem(msg.sender.selectedSlotIndex, item)
})
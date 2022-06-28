<script lang="ts" context="module">
    // define menus here so we can edit them from outside of this component
    export let addMenuItems:menuItem[] = [
        {
            type : "reg",
            title : "Test",
            desc : "Hi mom",
            cta : () => {}
        },
        {
            type : "reg",
            title : "public static void main string args",
            desc : "Based Java",
            cta : () => {alert("fuck")}
        },
        {
            type : "reg",
            title : "No",
            desc : "I am a motherfucker",
            cta : () => {}
        },
    ]
</script>

<script lang="ts">
    import FileNameEditor from "../ctrlMenuItems/FileNameEditor.svelte";
    import GeneralAppControl from "../ctrlMenuItems/GeneralAppControl.svelte";
    import DropdownControl, { menuItem } from "../ctrlMenuItems/GeneralAppControl/DropdownControl.svelte";

    export let leftMenuWidth:number;
    let appControlContWidth = 0;
    const appCtrlContWidthChange = (evt:CustomEvent<any>):void => {
        appControlContWidth = evt.detail.width;
    };

    // dropdown control stuff
    let dropdownStatus = {
        currentID : "addElement",
        active : true,
    }
    const toggleDropdown = () => {
        dropdownStatus.active = !dropdownStatus.active;
        // reset global mouse down
        document.onmouseup = undefined;
        
        // if active, set global mouseup so that any click outside of the box will togggle again. Give it a bit of delay so it works
        setTimeout(() => {
            if(dropdownStatus.active){
                document.onmouseup = () => {
                    dropdownStatus.active = false;
                };
                return;
            }
        }, 10);
    };
    const updateCurrentID = (evt:CustomEvent<any>) => {
        dropdownStatus.currentID = evt.detail.newID;
    };
</script>

<!-- HTML -->
<main style="width:calc(100vw - {leftMenuWidth}px); left:{leftMenuWidth}px">
    <!-- add elements -->
    <section id="left-ctrl">
        <DropdownControl imageURI="./assets/icons/plus.svg" alt="Add element" id="addElement" items={addMenuItems} {...dropdownStatus} on:toggleDropdown={toggleDropdown} on:updateCurrentID={updateCurrentID} evenSpacing={true}/>
    
        <section>
            <FileNameEditor leftMenuWidth={leftMenuWidth} controlSectionWidth={appControlContWidth}/>
            <div id="fileNameGrad"></div>
        </section>
    </section>

    <GeneralAppControl dropdownStatus={dropdownStatus} on:widthChange={appCtrlContWidthChange} on:toggleDropdown={toggleDropdown} on:updateCurrentID={updateCurrentID}/>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../public/global";

    main{
        height:65px;
        position: absolute; top:0;
        background-color: $primaryl1;
        border-bottom: 1px solid $primaryl4;
        z-index: 3;
        display:flex; justify-content: flex-start; align-items: center;
        transform: translate3d(1px,0px,0px);
        
        #left-ctrl{
            display: flex; align-items: center; height:100%;
            background-color: $primaryl1;
            z-index: 2;

            section{
                position: relative;
                #fileNameGrad{
                    position: absolute; top:0px; right:-20px;
                    height:120%; width:20px;
                    background: linear-gradient(90deg, $primaryl1 0%, hsla(200, 5%, 14%, 0%) 100%);
                }
            }
        }
    }
</style>
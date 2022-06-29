<script lang="ts" context="module">
    // define menus here so we can edit them from outside of this component
    export let addMenuItems:menuItem[] = [
        {
            type : "reg",
            title : "A",
            desc : "Anchor Tag",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Body",
            desc : "Document Body",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Button",
            desc : "Clickable Button",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Canvas",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Div",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "H1",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "H2",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "H3",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "H4",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "H5",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "H6",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "HR",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Input",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Label",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Ol",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Ul",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Progress",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "P",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Section",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Span",
            desc : "",
            cta : () => {}
        },
        {
            type : "reg",
            title : "Textarea",
            desc : "",
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
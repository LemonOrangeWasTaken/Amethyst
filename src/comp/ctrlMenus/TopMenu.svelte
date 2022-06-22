<script lang="ts">
    import FileNameEditor from "../ctrlMenuItems/FileNameEditor.svelte";
    import GeneralAppControl from "../ctrlMenuItems/GeneralAppControl.svelte";

    export let leftMenuWidth:number;
    let appControlContWidth = 0;
    const appCtrlContWidthChange = (evt:CustomEvent<any>):void => {
        appControlContWidth = evt.detail.width;
    };
</script>

<!-- HTML -->
<main style="width:calc(100vw - {leftMenuWidth}px); left:{leftMenuWidth}px">
    <section style="z-index:2">
        <FileNameEditor leftMenuWidth={leftMenuWidth} controlSectionWidth={appControlContWidth}/>
        <div id="fileNameGrad"></div>
    </section>
    <GeneralAppControl on:widthChange={appCtrlContWidthChange}/>
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
        overflow-y: hidden;
        
        section{
            position: relative;
            #fileNameGrad{
                position: absolute; top:-30px; right:-20px;
                height:100px; width:20px;
                background: linear-gradient(90deg, $primaryl1 0%, hsla(200, 5%, 14%, 0%) 100%);
                // background: linear-gradient(90deg, rgba(11,255,0,1) 0%, rgba(237,0,255,0) 100%);;
            }
        }
    }
</style>
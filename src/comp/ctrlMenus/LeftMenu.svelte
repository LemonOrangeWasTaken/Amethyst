<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import CollectionViewer from '../ctrlMenuItems/CollectionViewer.svelte';
    import ViewSwitcher from '../ctrlMenuItems/ViewSwitcher.svelte';
    const disp = createEventDispatcher();

    let dragSpace:HTMLDivElement;
    let currentWidth = 260;

    $: if(!!dragSpace){ // as soon as dragSpace is initialized, add the drag event listener for resize
        dragSpace.onmousedown = ():void => { // when dragging
            document.onmousemove = (e:MouseEvent):void => {
                e.preventDefault();
                document.body.style.cursor = "col-resize";  // set consistent cursor
                if(e.clientX < 350 && e.clientX > 200){
                    currentWidth = e.clientX;
                    disp("widthChange", {
                        width: currentWidth
                    });                    
                }
            }
        };
        document.onmouseup = ():void => { // when finished dragging
            document.body.style.cursor = "default"; // reset cursor
            document.onmousemove = undefined
        }
    }
</script>

<!-- HTML -->
<main style="width: {currentWidth}px">
    <ViewSwitcher />

    <!-- collection viewing system -->
    <CollectionViewer containerWidth={currentWidth}/>

    <!-- resize trigger -->
    <div bind:this={dragSpace} id="drag-space"></div>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../public/global";

    main{
        height:100vh;
        background-color: hsla(200, 5%, 14%, 0.42);
        border-right: 1px solid $primaryl4;
        position:absolute; top:0; left:0;
        -webkit-backdrop-filter: blur(30px);
        backdrop-filter: blur(30px);
        z-index: 4;
        user-select: none; -webkit-user-select: none; -webkit-user-drag: none;

        @supports (-moz-appearance:none) { // disable transparency on firefox because fuck them
            background-color: hsl(200, 5%, 10%) !important;
        }

        #drag-space{
            position:absolute;
            top:0; right: -3pt;
            height:100%; width:6pt;
            background-color: transparent;
            cursor:col-resize; z-index: 10;
        }
    }
</style>
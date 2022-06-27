<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const disp = createEventDispatcher();

    let dragSpace:HTMLDivElement;
    let currentWidth = 360;

    $: if(!!dragSpace){ // as soon as dragSpace is initialized, add the drag event listener for resize
        dragSpace.onmousedown = ():void => { // when dragging
            document.onmousemove = (e:MouseEvent):void => {
                e.preventDefault();
                document.body.style.cursor = "col-resize";  // set consistent cursor
                if(window.innerWidth - e.clientX < 500 && window.innerWidth - e.clientX > 300){
                    currentWidth = window.innerWidth - e.clientX;
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
    <!-- resize trigger -->
    <div bind:this={dragSpace} id="drag-space"></div>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../public/global";
    
    main{
        height:calc(100vh - 65px);
        background-color: $primaryl1;
        border-left: 1px solid $primaryl4;
        position:absolute; top:65px; right:0;
        -webkit-backdrop-filter: blur(30px);
        backdrop-filter: blur(30px);
        z-index: 2;

        #drag-space{
            position:absolute;
            top:0; left: -3pt;
            height:100%; width:6pt;
            background-color: transparent;
            cursor:col-resize; z-index: 10;
        }
    }
</style>
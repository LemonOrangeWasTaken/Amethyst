<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const disp = createEventDispatcher();

    let mainContainer:HTMLElement;

    $: if(!!mainContainer){
        disp("widthChange", {
            width: mainContainer.getBoundingClientRect().width + 100
        })
    }
</script>

<!-- HTML -->
<main bind:this={mainContainer}>
    <!-- TODO: contact server later to get pfp -->
    <img id="pfp" src="./assets/pngs/testpfp.png" alt="">

    <!-- export -->
    <div class="app-ctrl-icons">
        <img src="./assets/icons/share.svg" alt="">
    </div>

    <!-- check list -->
    <div class="app-ctrl-icons">
        <img src="./assets/icons/checkmark-circle-2.svg" alt="">
    </div>

    <!-- toggle light & dark mode -->
    <div class="app-ctrl-icons">
        <img src="./assets/icons/sun.svg" alt="">
    </div>

    <!-- add elements -->
    <div class="app-ctrl-icons multi">
        <img src="./assets/icons/plus.svg" alt="">
        <img class="more-options" src="./assets/icons/chevron-down.svg" alt="">
    </div>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../public/global";
    
    main{
        position: absolute; top:0; right:0;
        height: 100%; min-width: fit-content;
        background: none;
        display: flex; flex-direction: row-reverse; justify-content: center; align-items: center;
        padding-right: 45px;
    
        img{
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            cursor: pointer;
        }
        
        #pfp{
            height:32px;
            border-radius: 100px;
            margin-left: 21px;
        }

        .app-ctrl-icons{
            height:36px; width:50px;
            border-radius: 7px;
            margin-right: 5px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: background-color 200ms ease;

            img{
                filter: invert(1) brightness(0.5);
                height:24px;
                transition: filter 200ms ease;
            }

            &:hover{
                background-color: hsla(0,0%,100%,10%);
                img{
                    filter: invert(1) brightness(0.6);
                }
            }

            &.multi{
                width:65px;  
                
                .more-options{
                    height:20px;
                    transform: translate3d(2px,0px,0px);
                }
            }
        }
    }
</style>
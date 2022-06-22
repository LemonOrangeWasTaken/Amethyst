<script context="module" lang="ts">
    export interface selection {
        iconDir : string,
        storeIdentifier : string,
        alt? : string
    };
</script>

<script lang="ts">
    import type { Writable } from "svelte/store";

    export let elements : selection[];
    export let containerWidth : number;
    export let store : Writable<any>;

    let containerElement:HTMLElement;
    let correspondedElement:HTMLDivElement;
    let selector:HTMLDivElement;

    $: if(!!correspondedElement){
        // calculate the positional difference, and set translate3d for the selector (the purple highlight)
        const posDiff = correspondedElement.getBoundingClientRect().x - containerElement.getBoundingClientRect().x;
        selector.style.transform = `translate3d(${posDiff}px, 0, 0)`;
    };

    const updateView = (storeIdentifier:string):void => {
        $store = storeIdentifier;
    };
</script>

 <!--HTML -->
<main style="width: {containerWidth}px" bind:this={containerElement}>
    {#each elements as ele}
        {#if $store === ele.storeIdentifier} 
            <!-- if the current element corresponds to the store -->
            <div class="toggle-element" bind:this={correspondedElement} style="width:{containerWidth / elements.length}px">
                <img src={ele.iconDir} alt={ele.alt} class="selected">
            </div>
        {:else}
            <div class="toggle-element" style="width:{containerWidth / elements.length}px" on:click={() => updateView(ele.storeIdentifier)}>
                <img src={ele.iconDir} alt={ele.alt}>
            </div>
        {/if}
    {/each}

    <!-- the selector -->
    <div class="selector" bind:this={selector} style="width:{containerWidth / elements.length}px"></div>
</main>

 <!--STYLE -->
<style lang="scss">
    @import "../public/global";

    main{
        height:32px; width: 100px;
        background-color: hsl(0,0%,100%,0%);
        border-radius: 8px;
        margin-right:14px;
        display: flex; position:relative;
        transition: background-color 300ms ease; transition-delay: 0ms;
        overflow:hidden;
        
        &:hover{
            background-color: hsl(0,0%,100%,10%);
            transition-delay: 500ms
        }
        
        .toggle-element{
            z-index:2;
            height:100%;
            display: flex; justify-content: center; align-items: center;
            cursor:pointer;

            img{
                height:20px;
                margin:0; padding:0;
                filter: invert(1) brightness(0.7);
                user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            
                &.selected{
                    filter: invert(1) brightness(1);
                }
            }
        }

        .selector{
            height:100%;
            background: $accent;
            position:absolute;
            border-radius: 8px;
            transition: transform 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000);
        }
    }
</style>
<script context="module" lang="ts">
    export interface selection {
        iconDir : string,
        storeVal : string,
        elementID : string,
        alt? : string
    };
</script>

<script lang="ts">
    import { onMount } from "svelte";

    import type { Writable } from "svelte/store";

    export let elements : selection[];
    export let containerWidth : number;
    export let store : Writable<any>;
    export let defaultSelection : number;

    let containerElement:HTMLElement;
    let selectedElementID:string;
    let selector:HTMLDivElement;

    $: if(!!selectedElementID){
        // calculate the positional difference, and set translate3d for the selector (the purple highlight)
        const posDiff = document.getElementById(selectedElementID).getBoundingClientRect().x - containerElement.getBoundingClientRect().x;
        selector.style.transform = `translate3d(${posDiff}px, 0, 0)`;
    };

    const updateView = (storeVal:string, elementID:string):void => {
        $store = storeVal;
        selectedElementID = elementID;
    };

    // when initialized, set selectedElementID to the index speciied by defaultSelection
    onMount(():void => {
        $store = elements[defaultSelection].storeVal;
        selectedElementID = elements[defaultSelection].elementID;
    })
</script>

 <!--HTML -->
<main style="width: {containerWidth}px" bind:this={containerElement}>
    {#each elements as ele}
        <!-- use elementID to uniquely identify each choice -->
        <div class="toggle-element" id={ele.elementID} style="width:{containerWidth / elements.length}px" on:click={() => updateView(ele.storeVal, ele.elementID)}>
            <img src={ele.iconDir} alt={ele.alt} class={selectedElementID === ele.elementID ? "selected" : ""}>
        </div>
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
        }
        
        .toggle-element{
            z-index:2;
            height:100%;
            display: flex; justify-content: center; align-items: center;
            cursor:pointer;

            img{
                height:20px;
                margin:0; padding:0;
                filter: invert(1) brightness(0.5);
                user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
                transition: filter 100ms ease;
            
                &.selected{
                    filter: invert(1) brightness(1) !important;
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
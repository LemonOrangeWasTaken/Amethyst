<script lang="ts" context="module">
    export type optionTypes = "reg";
    export interface menuItem {
        type : optionTypes,
        title : string,
        desc? : string,
        cta : (any) => any
    }
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import RegularOption from '../DropdownOptions/RegularOption.svelte';
    
    const disp = createEventDispatcher()

    export let imageURI : string;
    export let alt : string;
    export let active : boolean;
    export let currentID : string;
    export let id : string;

    export let items : menuItem[];

    export let evenSpacing = false;

    const toggleDropdown = ():void => { // toggle the dropdown menu through dispatch
        disp("toggleDropdown");
    };
    const updateCurrentID = ():void => {
        disp("updateCurrentID", {
            newID : id
        });
    }
</script>

<!-- show the highlight and dropdown menu when active -->
<main on:mouseup={toggleDropdown} on:mouseenter={updateCurrentID} title={alt}
            class="{(active && id === currentID) ? "highlight" : ""} {evenSpacing ? "evenly-spaced" : ""}">
    <img src={imageURI} alt={alt}>
    <img class="more-options" src="./assets/icons/chevron-down.svg">

    {#if active && id === currentID}
        <div class="optionContainer">
            {#each items as item (item)}
                {#if item.type === "reg"}
                    <RegularOption options={item}/>                    
                {/if}                
            {/each}
        </div>
    {/if}
</main>

<style lang="scss">
    @import "../public/global";
    
    $btnHeight: 40px;

    main{
        height:$btnHeight; width:60px;
        border-radius: 7px;
        margin-right: 7px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background-color 200ms ease;
        position: relative;

        &.evenly-spaced{
            margin: 0px 10px 0px 10px;
        }
        &.highlight {
            background-color: hsla(0,0%,100%,10%);
            img{
                filter: invert(1) brightness(0.6);
            }
        }

        &:hover{
            background-color: hsla(0,0%,100%,10%);
            img{
                filter: invert(1) brightness(0.6);
            }
        }
        

        img{
            filter: invert(1) brightness(0.5);
            height:24px;
            transition: filter 200ms ease;
            transform: translate3d(6px,0px,0px);
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
        }
        .more-options{
            height:20px;
            transform: translate3d(6px,0px,0px);
        }
        .optionContainer{
            min-width: 220px; max-width: 500px; width: fit-content; min-height: 14px; max-height: calc(70vh);
            background-color: hsl(200,5%,13%,50%); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
            position: absolute; top:0; left:0; transform: translateY($btnHeight); margin-top:7px;
            border: 1px solid $primaryl4; border-radius: 7px;
            box-shadow: 0px 6px 30px -5px hsla(0,0%,0%,60%);
            z-index: 9999999;
            cursor:default;
            overflow: hidden;
            padding: 5px;
        }
    }
</style>
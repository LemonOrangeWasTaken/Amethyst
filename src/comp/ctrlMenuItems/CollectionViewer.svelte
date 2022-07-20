<script lang="ts">
    import Element from "./CollectionViewer/Element.svelte";
    import { collection, HTMltagInfo } from "../../stores/collection";
    import ComponentList from "./DragDropList/ComponentList.svelte";
    import VerticalDropZone from "./DragDropList/VerticalDropZone"

    import { reorder, type DropEvent } from 'svelte-dnd-list';
    
    export let containerWidth:number;

    function onDrop({ detail: { from, to } }: CustomEvent<DropEvent>) {
		if (!to || from === to) {
			return;
		}

		$collection = reorder($collection, from.index, to.index);
	}

    const layerHeight = 35; // px
</script>

<main>
    <!-- we use the keys to access the element map, and render everything based off of that -->
    <!-- {#each Object.keys($collection) as elementKey (elementKey)}
        <section class="elementContainer">
            <Element tagType={$collection[elementKey].type} elmntKey={elementKey} height={layerHeight} margin={layerMargin}/>
            {#if !!$collection[elementKey].styleOverrides && $collection[elementKey].showing}
                <section class="overrideContainer">
                    {#each $collection[elementKey].styleOverrides as override (override)}
                        <Override name={override.name} height={layerHeight} margin={layerMargin}/>
                    {/each}
                </section>
            {/if}
        </section>
    {/each} -->
    <!-- default height for each layer is 45. We can add if needed -->
    <ComponentList
        id="componentList"
        type={VerticalDropZone}
        itemSize={45}
        itemCount={$collection.length}
        layerHeight={layerHeight}
        containerWidth={containerWidth}
        on:drop={onDrop}
        let:index />
</main>

<style lang="scss">
    @import "../public/global";

    main{
        width:calc(100% - 10px); height:calc(100vh - 65px - 10px);
        display: flex; flex-direction: column; align-items: flex-start;
        padding: 0px 0px 10px 10px;
        background: none;
        overflow: hidden;

        &:hover{
            overflow: scroll;
        }

        .elementContainer{
            width:calc(100% - 10px);
            position: relative;
        }

        .overrideContainer{
            width:100%;
            // position:absolute; bottom:-100%;
        }
    }
</style>
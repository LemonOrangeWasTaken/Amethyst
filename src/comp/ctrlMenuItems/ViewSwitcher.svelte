<script lang="ts">
    import { currentView } from "../../stores/viewingMode";
    import MultiToggle, { selection } from "../controls/MultiToggle.svelte";

    const viewToggleElements:selection[] = [
        {
            iconDir : "./assets/icons/cube.svg",
            storeIdentifier : "edit",
            alt : "edit"
        }, {
            iconDir : "./assets/icons/pantone.svg",
            storeIdentifier : "palette",
            alt : "palette"
        }
    ]
</script>

<!-- HTML -->
<main>
    <a href="https://google.com"><img src="./assets/svgs/emblem_flat.svg" alt=""></a>
    <MultiToggle elements={viewToggleElements} containerWidth={104} store={currentView}/>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../public/global";

    main{
        width:100%; height: 65px;
        display:flex; justify-content: space-between; align-items: center;

        a{
            opacity:0.2;
            transition: opacity 100ms ease;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;

            img{
                height:30px;
                padding:15px;
                user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            }

            &:hover{
                opacity:0.4;
            }
        }
    }
</style>
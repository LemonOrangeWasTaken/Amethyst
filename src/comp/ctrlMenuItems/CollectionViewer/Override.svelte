<script lang="ts">
    import { fly } from "svelte/transition";

    export let name:string;
    export let height:number;
</script>

<main style="min-height: {height}px;" in:fly={{y:-10, duration:300}}>
    <!-- icon + title -->
    <img src="./assets/icons/copy.svg" alt="">
    <p>{name}</p>

</main>

<style lang="scss">
    @import "../public/global";

    main{
        min-width: calc(100% - 10px);
        border-radius: 6px;
        display: flex; align-items: center;
        margin: 0px;
        cursor:pointer;
        transition: background-color 100ms ease;
        margin-bottom:10px;

        &:hover{
            background-color: hsla(0,0%,100%,7%);
        }

        img{
            transition: 200ms filter ease;
            filter: invert(1) brightness(0.5);
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            height: 18px;
            margin: 0px 10px 0px 10px;
        }

        p{
            font-size: 14px;
            font-variation-settings: "wght" 400;
            color: $secondarys2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: calc(100% - 50px);
        }
    }
</style>
<script lang="ts">
    export let imageURI : string;
    export let alt : string;
    export let cta : (any) => any = () => {};
</script>

<main on:click={cta} title={alt}>
    <img src={imageURI} alt={alt}>
    <img class="more-options" src="./assets/icons/chevron-down.svg" alt="">
</main>

<style lang="scss">
    @import "../public/global";
    
    main{
        height:40px; width:60px;
        border-radius: 7px;
        margin-right: 7px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background-color 200ms ease;

        img{
            filter: invert(1) brightness(0.5);
            height:24px;
            transition: filter 200ms ease;
            transform: translate3d(6px,0px,0px);
        }

        &:hover{
            background-color: hsla(0,0%,100%,10%);
            img{
                filter: invert(1) brightness(0.6);
            }
        }

        .more-options{
            height:20px;
            transform: translate3d(6px,0px,0px);
        }
    }
</style>
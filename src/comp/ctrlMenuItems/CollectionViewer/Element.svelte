<script lang="ts">
    import { collection, element, HTMLtag, HTMltagInfo } from "../../../stores/collection";

    export let tagType:string;
    export let elmntIndex:number;
    export let height:number;
    export let width:number;
    export let iconURI:string;

    const toggleShow = ():void => {
        $collection[elmntIndex].showing = !$collection[elmntIndex].showing;
    }
</script>
 
<main style="min-height: {height}px; min-width:{width}px">
    <!-- arrow -->
    <div on:click={toggleShow}>
        <img src="./assets/icons/arrow-ios-forward.svg" class={$collection[elmntIndex].showing ? "showArrow" : ""} alt=""
        title={$collection[elmntIndex].showing ? "collapse" : "expand"}>
    </div>
    <!-- icon + title -->
    <img rel="preload" src={iconURI} alt="">
    <p>{HTMltagInfo[tagType].name}</p>
</main>

<style lang="scss">
    @import "../public/global";

    main{
        background-color: hsla(0,0%,100%,15%);
        backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
        border-radius: 6px;
        display: flex; align-items: center;
        margin: 0px;
        cursor:pointer;

        img{
            transition: 200ms filter ease;
            filter: invert(1) brightness(0.75);
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            height: 18px;
            margin: 0px 10px 0px 5px;
        }

        p{
            font-size: 14px;
            font-variation-settings: "wght" 600;
            color: $secondarys1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: calc(100% - 80px);
        }
    
        div{
            display: flex; align-items: center; justify-content: center;
            transition: 200ms background-color ease;
            min-height:26px; min-width: 26px;
            border-radius: 5px;
            margin: 0px 0px 0px 4px;

            &:hover{
                background-color: hsl(0,0%,100%,20%);
                
                img{
                    filter: invert(1) brightness(0.95); // brighten up the icon on hover
                }
            }

            img{
                margin: 0px;
                filter: invert(1) brightness(0.5); // dim down the arrow icon
                transform: rotate(0deg);
                transition: transform 200ms cubic-bezier(0.215, 0.610, 0.355, 1.000);
            }

            .showArrow{
                transform: rotate(90deg);
            }
        }
    }
</style>
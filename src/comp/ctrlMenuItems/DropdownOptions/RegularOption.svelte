<script lang="ts">
    import type { menuItem } from "../GeneralAppControl/DropdownControl.svelte";

    export let options : menuItem;
</script>

<main title={options.title} on:mouseup={options.cta}>
    <p id="title">{options.title}</p>
    <!-- description -->
    {#if !!options.desc}
        <p id="desc">{options.desc}</p>
    {/if}
</main>

<style lang="scss">
    @import "../public/global";

    main{
        min-width:100%; width:fit-content; height:27px;
        border-radius: 5px;
        margin: 0px;
        background-color: none;
        display: flex; justify-content: space-between; align-items: center;
        cursor:pointer;

        &:hover{
            background-color: $accent;

            #title{
                color: $secondary
            }
            #desc{
                color: $secondarys2
            }
        }

        p{
            user-select: none; -webkit-user-select: none;
        }

        #title{
            color:$secondarys4;
            font-size: 13px;
            margin: 0px 7px 0px 7px;
            white-space: nowrap;
            font-variation-settings: "wght" 450;
        }

        #desc{
            color:$secondarys6;
            font-size: 13px;
            margin: 0px 7px 0px 50px;
            white-space: nowrap;    
        }
    }
</style>
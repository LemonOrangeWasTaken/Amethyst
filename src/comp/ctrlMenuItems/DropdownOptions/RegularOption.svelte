<script lang="ts">
    import type { menuItem } from "../GeneralAppControl/DropdownControl.svelte";

    export let options : menuItem;
</script>

<main title={options.title} on:mouseup={options.cta}>
    <section>
        <!-- icons -->
        {#if !!options.iconSrc}
            <img src={options.iconSrc} width=15px height=15px/>
        {/if}
        <!-- title -->
        <p id="title">{options.title}</p>

    </section>

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

            #desc{
                color: $secondarys2
            }

            section{
                img{
                    filter: invert(1) brightness(1) !important;
                }
                #title{
                    color: $secondary
                }
            }
        }

        section{
            display: flex; align-items: center;

            img{
                filter: invert(1) brightness(0.7) !important;
                margin: 0px 0px 0px 7px;
            }

            p{
                user-select: none; -webkit-user-select: none;
            }

            #title{
                color:$secondarys4;
                font-size: 13px;
                margin: 0px 7px 0px 11px;
                white-space: nowrap;
                font-variation-settings: "wght" 450;
            }
        }

        #desc{
            color:$secondarys6;
            font-size: 13px;
            margin: 0px 7px 0px 75px;
            white-space: nowrap;    
        }
    }
</style>
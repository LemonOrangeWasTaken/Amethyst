<script lang="ts">
    import LeftMenu from "./comp/ctrlMenus/LeftMenu.svelte";
    import RightMenu from "./comp/ctrlMenus/RightMenu.svelte";
    import TopMenu from "./comp/ctrlMenus/TopMenu.svelte";
    import MainDisplay from "./comp/display/MainDisplay.svelte";

    let leftMenuWidth = 260;
    const leftMenuWidthChange = (evt:CustomEvent<any>):void => {
        leftMenuWidth = evt.detail.width;
    };

    let rightMenuWidth = 360;
    const rightMenuWidthChange = (evt:CustomEvent<any>):void => {
        rightMenuWidth = evt.detail.width;
    };
</script>

<main>
   <LeftMenu on:widthChange={leftMenuWidthChange}/> 
   <TopMenu leftMenuWidth={leftMenuWidth}/> 
   <RightMenu on:widthChange={rightMenuWidthChange}/>

   <MainDisplay leftMenuWidth={leftMenuWidth} rightMenuWidth={rightMenuWidth}/>
</main>

<style lang="scss">
    @import "../public/global";

    main{
        width:100vw; height:100vh;
        z-index: 1;
    }
</style>
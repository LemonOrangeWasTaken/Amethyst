import { writable, get } from 'svelte/store';

export type HTMLtag = "A" | "BODY" | "BUTTON" | "CANVAS" | "DIV" | "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "HR" | "INPUT" | "LABEL" | "OL" | "UL" | "PROGRESS" | "P" | "SECTION" | "SPAN" | "TEXTAREA";
export type units = "px" | "pt" | "pc" | "em" | "rem" | "vw" | "vh" | "%" | "fit-content";
export type borderOutlineStyle = "DOTTED" | "DASHED" | "SOLID" | "DOUBLE" | "GROOVE" | "RIDGE" | "RIDGE" | "INSET" | "OUTSET" | "NONE" | "HIDDEN";
export type typography = "poppins";
export type textAlignment = "center" | "left" | "right" | "justify";
export type textTransform = "uppercase" | "lowercase" | "capitalize";
export type overflow = "visible" | "hidden" | "scroll"

export interface unitedAttr<T>{
    name : T,
    unit : units
}

export interface numberRange{
    low : 0,
    high : 100
}

export interface shadow{
    radius : unitedAttr<number>,
    x : unitedAttr<number>,
    y : unitedAttr<number>,
    color : string
} export interface boxShadow {
    base : shadow,
    grow : unitedAttr<number>,
    inset : boolean
}

export interface elementStyle{
    backgroundColor : string,
    opacity : number,
    boxShadows : boxShadow[],
    overflowX : overflow,
    overflowY : overflow,

    borderWidthTop : unitedAttr<number>,
    borderWidthRight : unitedAttr<number>,
    borderWidthBottom : unitedAttr<number>,
    borderWidthLeft : unitedAttr<number>,
    borderColor : string,
    borderStyle : borderOutlineStyle,
    borderRadius : unitedAttr<number>,

    marginTop : unitedAttr<number>,
    marginRight : unitedAttr<number>,
    marginBottom : unitedAttr<number>,
    marginLeft : unitedAttr<number>,

    paddingTop : unitedAttr<number>,
    paddingRight : unitedAttr<number>,
    paddingBottom : unitedAttr<number>,
    paddingLeft : unitedAttr<number>,

    height : unitedAttr<number>,
    width : unitedAttr<number>,

    outlineWidth : unitedAttr<number>,
    outlineColor : string,
    outlineStyle : borderOutlineStyle,
    outlineRadius : unitedAttr<number>,
    outlineOffset : unitedAttr<number>,

    fontFamily : typography,
    fontWeight : numberRange,
    fontSize : unitedAttr<number>,
    lineHeight : unitedAttr<number>,
    letterSpacing : unitedAttr<number>,
    color : string,
    textAlign : textAlignment,
    textTranform : textTransform,
    textShadows : shadow[],

    content : string,
    placeholder : string,

    translateX : unitedAttr<number>,
    translateY : unitedAttr<number>,
    scaleX : number,
    scaleY : number,  
};

export interface override{
    name : string,
	style : elementStyle
};

export interface element{
    type : HTMLtag,
    style : elementStyle
    styleOverrides : override[]
};

export interface collection{
    elements : element[] // our group of elements
};

export let collection = writable<collection>();
import React from "react";
import './PageTitle.css'

const PageTitle = ({title, style})=>{
    return (
        <h1 className={style}>{title}</h1>
    )
}

export default PageTitle;
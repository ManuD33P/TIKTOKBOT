import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";


export default (state,onChangePreferents,key) => {

    useEffect(()=>{},
    [state])
    
    return (
        state ? 
        <Checkbox 
                            id={key}
                            defaultChecked
                            onCheckedChange= {(e)=> onChangePreferents({
                              key:{key},
                              value:e
                            }) }
        />
        :
        <Checkbox 
        id={key}
        onCheckedChange= {(e)=> onChangePreferents({
          key:{key},
          value:e
        }) }
/>
    )
}
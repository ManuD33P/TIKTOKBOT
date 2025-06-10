import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";


export default function CheckboxFunction(state,onChangePreferents,key){
    return (
        state ? 
        <Checkbox 
                            id={key}
                            defaultChecked
                            onCheckedChange= {(e)=> onChangePreferents({
                              key,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useCallback } from "react";


export default function CheckboxFunction(state,onChangePreferents,key){
  const prop = key;
    return (
        state ? 
        <Checkbox 
                            id={prop}
                            defaultChecked
                            onCheckedChange= {(e)=> onChangePreferents({
                              prop,
                              value:e
                            }) }
        />
        :
        <Checkbox 
        id={prop}
        onCheckedChange= {(e)=> onChangePreferents({
          key:{prop},
          value:e
        }) }
/>
    )
}
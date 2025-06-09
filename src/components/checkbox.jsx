import { Checkbox } from "@/components/ui/checkbox";


export default (state,onChangePreferents,key) => {


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
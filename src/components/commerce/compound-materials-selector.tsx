import React from 'react';
import { Material } from '@/lib/swipall/types/types';
import { ExtraMaterialsInterface } from "./product-info";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CompoundMaterialsSelectorProps {
    extraMaterials: ExtraMaterialsInterface;
    selectedMaterials: Material[];
    onSelectMaterial: (material: Material) => void;
    onRemoveMaterial: (materialId: string) => void;
}

export default function CompoundMaterialsSelector({ extraMaterials, selectedMaterials, onSelectMaterial, onRemoveMaterial }: CompoundMaterialsSelectorProps) {
    const selectedByTaxonomy = React.useMemo(() => {
        const materialIdToTaxonomy = new Map<string, string>();
        for (const group of extraMaterials) {
            for (const m of group.materials) {
                materialIdToTaxonomy.set(m.id, group.taxonomy);
            }
        }
        const map = new Map<string, Material>();
        for (const sm of selectedMaterials) {
            const tax = materialIdToTaxonomy.get(sm.id);
            if (tax) map.set(tax, sm);
        }
        return map;
    }, [extraMaterials, selectedMaterials]);

    const handleRemove = React.useCallback((taxonomy: string) => {
        const selected = selectedByTaxonomy.get(taxonomy);
        if (selected) onRemoveMaterial(selected.id);
    }, [selectedByTaxonomy, onRemoveMaterial]);

    return (
        <div className="mb-6">
            <h3 className="font-semibold mb-2">Elige los ingredientes:</h3>
            {
                extraMaterials.map((materialGroup) => (
                    <div key={materialGroup.taxonomy} className="mb-4">
                        <h3 className="mb-2">{materialGroup.taxonomy}</h3>

                        {selectedByTaxonomy.has(materialGroup.taxonomy) ? (
                            <div className='flex items-center justify-between border px-2 rounded-md'>
                                <span className='text-sm font-normal text-foreground'>
                                    {selectedByTaxonomy.get(materialGroup.taxonomy)?.name}
                                </span>
                                <button className='py-2 text-red-600 hover:text-red-800 hover:cursor-pointer' role='button' onClick={() => handleRemove(materialGroup.taxonomy)}>Quitar</button>
                            </div>
                        ) : (
                            <Select
                                value={selectedByTaxonomy.get(materialGroup.taxonomy)?.id}
                                onValueChange={(value) => {
                                    const selectedMaterial = materialGroup.materials.find(mat => mat.id === value);
                                    if (selectedMaterial) onSelectMaterial(selectedMaterial);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={`Selecciona ${materialGroup.taxonomy}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {materialGroup.materials.map((material) => (
                                        <SelectItem key={material.id} value={material.id}>
                                            {material.name} {`- $${material.price}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ))
            }
        </div>
    )
}
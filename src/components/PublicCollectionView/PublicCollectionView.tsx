import CollectionView from "@/components/Collection/CollectionView/CollectionView";
import type { PublicCollection } from "@/types/collectionPublic";
import { Business } from "@/types/database";

type Props = {
    business: Pick<Business, "name" | "cover_image">;
    collection: PublicCollection;
};

export default function PublicCollectionView({ business, collection }: Props) {
    console.log(collection.style);
    return (
        <CollectionView
            mode="public"
            businessName={business.name}
            businessImage={business.cover_image ?? null}
            collectionTitle={collection.title}
            sections={collection.sections.map(s => ({
                id: s.id,
                name: s.name,
                items: s.items.map(it => ({
                    id: it.id,
                    name: it.name,
                    description: it.description ?? null,
                    image: it.image ?? null,
                    price: it.price ?? null
                }))
            }))}
            style={collection.style}
        />
    );
}

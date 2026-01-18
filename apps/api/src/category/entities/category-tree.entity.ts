export class CategoryTreeEntity {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  children: CategoryTreeEntity[];
}
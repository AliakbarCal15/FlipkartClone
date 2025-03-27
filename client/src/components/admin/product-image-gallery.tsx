import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Plus, X, ChevronLeft, ChevronRight, Trash, Upload, Check } from "lucide-react";
import { Product } from "./manage-products";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface ProductImageGalleryProps {
  product: Product;
  onUpdateImages: (productId: number, images: string[], thumbnail: string) => void;
}

export const ProductImageGallery = ({ product, onUpdateImages }: ProductImageGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<string[]>(product.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [thumbnailIndex, setThumbnailIndex] = useState(
    product.thumbnail ? product.images.indexOf(product.thumbnail) : 0
  );
  const { toast } = useToast();

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    
    // Simple URL validation
    try {
      new URL(newImageUrl);
      setImages([...images, newImageUrl]);
      setNewImageUrl("");
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    
    // Adjust indices if needed
    let newActiveIndex = activeImageIndex;
    let newThumbnailIndex = thumbnailIndex;
    
    if (newImages.length === 0) {
      newActiveIndex = 0;
      newThumbnailIndex = 0;
    } else {
      if (index === activeImageIndex) {
        newActiveIndex = Math.max(0, activeImageIndex - 1);
      } else if (index < activeImageIndex) {
        newActiveIndex = activeImageIndex - 1;
      }
      
      if (index === thumbnailIndex) {
        newThumbnailIndex = 0;
      } else if (index < thumbnailIndex) {
        newThumbnailIndex = thumbnailIndex - 1;
      }
    }
    
    setImages(newImages);
    setActiveImageIndex(newActiveIndex);
    setThumbnailIndex(newThumbnailIndex);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const reorderedImages = [...images];
    const [movedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, movedImage);
    
    // Update indices
    let newActiveIndex = activeImageIndex;
    let newThumbnailIndex = thumbnailIndex;
    
    if (result.source.index === activeImageIndex) {
      newActiveIndex = result.destination.index;
    } else if (
      result.source.index < activeImageIndex && 
      result.destination.index >= activeImageIndex
    ) {
      newActiveIndex = activeImageIndex - 1;
    } else if (
      result.source.index > activeImageIndex && 
      result.destination.index <= activeImageIndex
    ) {
      newActiveIndex = activeImageIndex + 1;
    }
    
    if (result.source.index === thumbnailIndex) {
      newThumbnailIndex = result.destination.index;
    } else if (
      result.source.index < thumbnailIndex && 
      result.destination.index >= thumbnailIndex
    ) {
      newThumbnailIndex = thumbnailIndex - 1;
    } else if (
      result.source.index > thumbnailIndex && 
      result.destination.index <= thumbnailIndex
    ) {
      newThumbnailIndex = thumbnailIndex + 1;
    }
    
    setImages(reorderedImages);
    setActiveImageIndex(newActiveIndex);
    setThumbnailIndex(newThumbnailIndex);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleSetThumbnail = (index: number) => {
    setThumbnailIndex(index);
  };

  const handleSave = () => {
    // Save the updated images and thumbnail
    const thumbnail = images[thumbnailIndex] || "";
    onUpdateImages(product.id, images, thumbnail);
    
    toast({
      title: "Images Updated",
      description: "Product images have been updated successfully",
    });
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Image className="mr-2 h-4 w-4" />
          Manage Images
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Product Image Gallery</DialogTitle>
          <DialogDescription>
            Manage images for {product.title}. Drag to reorder, click to set as thumbnail.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Main image carousel */}
          <div className="relative rounded-md overflow-hidden bg-muted aspect-video flex items-center justify-center mb-2">
            {images.length > 0 ? (
              <>
                <img
                  src={images[activeImageIndex]}
                  alt={`Product image ${activeImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                  }}
                />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Image info */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No images available</p>
              </div>
            )}
          </div>
          
          {/* Thumbnail selector */}
          <ScrollArea className="h-[120px] border rounded-md p-2">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="thumbnails" direction="horizontal">
                {(provided) => (
                  <div 
                    className="flex gap-2"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {images.map((image, index) => (
                      <Draggable key={`${image}-${index}`} draggableId={`${image}-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative rounded-md overflow-hidden border-2 ${
                              index === activeImageIndex ? 'border-primary' : 'border-transparent'
                            } ${index === thumbnailIndex ? 'ring-2 ring-yellow-400' : ''}`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <div 
                              className="h-20 w-20 cursor-pointer"
                              onClick={() => setActiveImageIndex(index)}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=Error";
                                }}
                              />
                            </div>
                            <div className="absolute top-0 right-0 flex gap-1">
                              <button
                                className="w-5 h-5 bg-red-500 text-white flex items-center justify-center rounded-bl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(index);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <button
                                className={`w-5 h-5 ${
                                  index === thumbnailIndex ? 'bg-yellow-400' : 'bg-black/50'
                                } text-white flex items-center justify-center`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetThumbnail(index);
                                }}
                                title="Set as thumbnail"
                              >
                                {index === thumbnailIndex ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Image className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </ScrollArea>
          
          {/* Add new image */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="new-image-url">Add Image URL</Label>
              <Input
                id="new-image-url"
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={handleAddImage}
              variant="secondary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="flex justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {images.length} images • {thumbnailIndex >= 0 ? 'Thumbnail selected' : 'No thumbnail selected'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import React from "react";
import {
    Image as ChakraImage,
    type ImageProps as ChakraImageProps,
} from "@chakra-ui/react";
import NextImage, {
    type ImageProps as NextImageProps,
} from "next/image";

type ImageCustomProps = Omit<ChakraImageProps, "src" | "alt" | "as"> &
    Omit<NextImageProps, "src" | "alt"> & {
        src: string;
        alt: string;

    };

const ImageCustom = React.forwardRef<HTMLImageElement, ImageCustomProps>(
    ({
        src,
        alt,
        width,
        height,
        fill,
        loader,
        sizes,
        quality,
        style,
        priority,
        loading,
        placeholder,
        blurDataURL,
        onLoad,
        onError,
        unoptimized,
        overrideSrc,
        decoding,
        ...chakraProps
    }, ref) => {
        return (
            <ChakraImage asChild ref={ref} {...chakraProps}>
                <NextImage
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    fill={fill}
                    loader={loader}
                    sizes={sizes}
                    quality={quality}
                    style={style}
                    priority={priority}
                    loading={loading}
                    placeholder={placeholder}
                    blurDataURL={blurDataURL}
                    onLoad={onLoad}
                    onError={onError}
                    unoptimized={unoptimized}
                    decoding={decoding}
                />
            </ChakraImage>
        );
    }
);

export default ImageCustom;

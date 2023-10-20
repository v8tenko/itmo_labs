import Konva from 'konva';
import {BaseComponent} from './base';

interface PictureConfig {
    width: number;
    height: number;
    src: string;
}

const pictureFactory = (src: string) =>
    class extends BaseComponent<PictureConfig> {
        build() {
            const {width, height} = this._props;
            const image = new Image(width, height);

            image.src = src;

            this.add(new Konva.Image({image, width, height}));

            return this;
        }
    };

const Presets = {
    Battery: pictureFactory('norm.jpeg'),
    from(props: PictureConfig & Konva.ShapeConfig): BaseComponent<PictureConfig> {
        const Cls = pictureFactory(props.src);

        return new Cls(props);
    },
    da: pictureFactory('giga.png'),
};

export {Presets};
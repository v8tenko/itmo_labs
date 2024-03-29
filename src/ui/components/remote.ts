import Konva from 'konva';

import {state} from '@labs/state';
import {EquipmentEntity} from '@labs/server';
import {BaseComponent} from './base';
import {Picture} from './picture';
import {Cell} from './cell';
import {ProcessedPhysics, create} from 'physics';

type RemoteProps = {
    name: string;
    onDragEnd(event: Konva.KonvaEventObject<unknown>): void;
};

/** Used to render component from server */
class RemoteComponent extends BaseComponent<EquipmentEntity & RemoteProps> {
    isEnvironment = false;
    physics: ProcessedPhysics;
    type: string;

    private _renderedPorts: Cell[] = [];

    constructor({name, onDragEnd}: RemoteProps) {
        const props = state.remote(name);

        if (!props) {
            throw new Error(`Unable to create: ${name} component is not defined`);
        }

        super({...props, name, onDragEnd} as EquipmentEntity & RemoteProps);

        this.type = name;
        this.physics = create(props.physics);
    }

    configure() {
        this.draggable(true);
        this.registerCallback('dragend', (event) => {
            this._props.onDragEnd(event);
            this.renderPorts();

            const relations = state.relations(this.id());

            if (!relations.length) {
                return;
            }

            relations.forEach((component) => {
                state.disconnect(this, component);
            });

            this.renderPorts();
        });

        if (this._props.ports) {
            this.name('with-ports');
        }

        this.registerCallback('dragstart', () => {
            this._renderedPorts.forEach((port) => {
                port.fill('white');
                port.borrow();
            });

            this._renderedPorts.length = 0;
        });
    }

    build() {
        const {src} = this._props;

        this.render(new Picture({src: src.base, width: this.width(), height: this.height()}));

        return this;
    }

    renderPorts() {
        if (!this._props.ports) {
            return;
        }

        const start = state.position(this.getAbsolutePosition());

        for (const port of this._props.ports) {
            const [x, y] = port.position;

            const point = {
                x: start.x + x - 1,
                y: start.y + y - 1,
            };

            try {
                const cell = this.layer().cell(point);

                if (cell) {
                    // coz some ports can overflow screen

                    this._renderedPorts.push(cell);
                    cell.fill('red');
                    cell.borrow(this);
                }
            } catch {}
        }
    }
}

export {RemoteComponent};

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Animated } from 'react-native';
import LEDText from '../src/components/LEDText';

function triggerTextLayout(tree, width = 120) {
    const layoutNode = tree.root.findAll(
        (node) => typeof node.props?.onLayout === 'function'
    )[0];

    act(() => {
        layoutNode.props.onLayout({
            nativeEvent: { layout: { width } },
        });
    });
}

describe('LEDText', () => {
    let timingSpy;
    let createdAnimations;

    beforeEach(() => {
        createdAnimations = [];
        timingSpy = jest.spyOn(Animated, 'timing').mockImplementation(() => {
            const animation = {
                start: jest.fn((onEnd) => {
                    animation.onEnd = onEnd;
                }),
                stop: jest.fn(),
            };
            createdAnimations.push(animation);
            return animation;
        });
    });

    afterEach(() => {
        timingSpy.mockRestore();
        jest.clearAllMocks();
    });

    test('fires onScrollCycleStart at the start of each marquee pass', () => {
        const onScrollCycleStart = jest.fn();
        let tree;

        act(() => {
            tree = renderer.create(
                <LEDText
                    text="TEST MARQUEE"
                    scroll={true}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                />
            );
        });

        triggerTextLayout(tree, 140);

        expect(Animated.timing).toHaveBeenCalledTimes(1);
        expect(onScrollCycleStart).toHaveBeenCalledTimes(1);

        act(() => {
            createdAnimations[0].onEnd?.({ finished: true });
        });

        expect(Animated.timing).toHaveBeenCalledTimes(2);
        expect(onScrollCycleStart).toHaveBeenCalledTimes(2);

        act(() => {
            tree.unmount();
        });
    });

    test('does not fire cycle callback when scroll is disabled', () => {
        const onScrollCycleStart = jest.fn();

        act(() => {
            renderer.create(
                <LEDText
                    text="STATIC"
                    scroll={false}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                />
            );
        });

        expect(Animated.timing).not.toHaveBeenCalled();
        expect(onScrollCycleStart).not.toHaveBeenCalled();
    });

    test('does not restart marquee loop on text prop changes alone', () => {
        const onScrollCycleStart = jest.fn();
        let tree;

        act(() => {
            tree = renderer.create(
                <LEDText
                    text="FIRST MESSAGE"
                    scroll={true}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                />
            );
        });

        triggerTextLayout(tree, 160);
        expect(Animated.timing).toHaveBeenCalledTimes(1);

        act(() => {
            tree.update(
                <LEDText
                    text="SECOND MESSAGE"
                    scroll={true}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                />
            );
        });

        expect(Animated.timing).toHaveBeenCalledTimes(1);
        expect(onScrollCycleStart).toHaveBeenCalledTimes(1);

        act(() => {
            tree.unmount();
        });
    });

    test('does not restart mid-pass when text width changes', () => {
        const onScrollCycleStart = jest.fn();
        let tree;

        act(() => {
            tree = renderer.create(
                <LEDText
                    text="WIDTH TEST A"
                    scroll={true}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                />
            );
        });

        triggerTextLayout(tree, 160);
        expect(Animated.timing).toHaveBeenCalledTimes(1);

        act(() => {
            tree.update(
                <LEDText
                    text="WIDTH TEST BBBBBBB"
                    scroll={true}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                />
            );
        });

        triggerTextLayout(tree, 220);
        expect(Animated.timing).toHaveBeenCalledTimes(1);

        act(() => {
            createdAnimations[0].onEnd?.({ finished: true });
        });

        expect(Animated.timing).toHaveBeenCalledTimes(2);
        expect(Animated.timing.mock.calls[1][1].toValue).toBe(-220);

        act(() => {
            tree.unmount();
        });
    });

    test('restarts marquee when resetToken changes', () => {
        const onScrollCycleStart = jest.fn();
        let tree;

        act(() => {
            tree = renderer.create(
                <LEDText
                    text="RESET TEST"
                    scroll={true}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                    resetToken={0}
                />
            );
        });

        triggerTextLayout(tree, 140);
        expect(Animated.timing).toHaveBeenCalledTimes(1);

        act(() => {
            tree.update(
                <LEDText
                    text="RESET TEST"
                    scroll={true}
                    flicker={false}
                    onScrollCycleStart={onScrollCycleStart}
                    resetToken={1}
                />
            );
        });

        expect(createdAnimations[0].stop).toHaveBeenCalledTimes(1);
        expect(Animated.timing).toHaveBeenCalledTimes(2);

        act(() => {
            tree.unmount();
        });
    });
});

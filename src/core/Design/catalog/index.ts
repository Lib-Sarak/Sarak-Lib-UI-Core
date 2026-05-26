import ModeTokens from './partitions/mode.json';
import NavigationStyleTokens from './partitions/navigation_style.json';
import BodySizeTokens from './partitions/body_size.json';
import BrandingConfigTokens from './partitions/branding_config.json';
import ColorsAndAtmosphereTokens from './partitions/colors_and_atmosphere.json';
import TypographyTokens from './partitions/typography.json';
import LayoutAndNavigationTokens from './partitions/layout_and_navigation.json';
import ComponentsBaseTokens from './partitions/components_base.json';
import CardsEngineTokens from './partitions/cards_engine.json';
import DataAndChartsTokens from './partitions/data_and_charts.json';
import MotionAndAnimationTokens from './partitions/motion_and_animation.json';
import SpecializedEnginesTokens from './partitions/specialized_engines.json';

export const TokenCatalog = [
    ...ModeTokens,
    ...NavigationStyleTokens,
    ...BodySizeTokens,
    ...BrandingConfigTokens,
    ...ColorsAndAtmosphereTokens,
    ...TypographyTokens,
    ...LayoutAndNavigationTokens,
    ...ComponentsBaseTokens,
    ...CardsEngineTokens,
    ...DataAndChartsTokens,
    ...MotionAndAnimationTokens,
    ...SpecializedEnginesTokens
];

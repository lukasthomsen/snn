import {
  Check,
  CheckCircle,
  CheckCircleSolid,
  Clock,
  CreditCard,
  Eye,
  EyeClosed,
  Globe,
  Heart,
  HelpCircle,
  InfoCircle,
  InfoCircleSolid,
  JournalPage,
  Lock,
  Mail,
  MailIn,
  Minus,
  NavArrowDown,
  NavArrowRight,
  Notes,
  OpenBook,
  Package,
  PercentageCircle,
  Plus,
  Ruler,
  Search,
  ShareAndroid,
  ShieldCheck,
  SmartphoneDevice,
  ShoppingBag,
  Star,
  Truck,
  User,
  Xmark,
} from "iconoir-react";
import type {
  ForwardRefExoticComponent,
  RefAttributes,
  SVGAttributes,
  SVGProps as ReactSvgProps,
} from "react";

type BrandIconProps = SVGAttributes<SVGSVGElement> & {
  size?: number;
};

type IconoirIconProps = Omit<ReactSvgProps<SVGSVGElement>, "height" | "width"> & {
  size?: number;
};

type IconoirComponent = ForwardRefExoticComponent<
  Omit<ReactSvgProps<SVGSVGElement>, "ref"> & RefAttributes<SVGSVGElement>
>;

function withIconoirDefaults(Icon: IconoirComponent) {
  return function IconoirWrapper({
    size = 18,
    strokeWidth = 1.8,
    ...props
  }: IconoirIconProps) {
    return <Icon {...props} height={size} strokeWidth={strokeWidth} width={size} />;
  };
}

export function GoogleLogoIcon({ size = 18, ...props }: BrandIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height={size}
      viewBox="0 0 18 18"
      width={size}
      {...props}
    >
      <path
        d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.796 2.7164v2.2582h2.9087c1.7018-1.5664 2.6837-3.8741 2.6837-6.6155z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1791l-2.9087-2.2582c-.8063.5409-1.8363.8609-3.0477.8609-2.3441 0-4.3282-1.5832-5.0359-3.7105H.9573v2.3327A8.9979 8.9979 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.9641 10.7131A5.4103 5.4103 0 0 1 3.682 9c0-.5945.1023-1.1727.2821-1.7131V4.9545H.9573A8.9977 8.9977 0 0 0 0 9c0 1.4523.3477 2.8273.9573 4.0455l3.0068-2.3324z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.5768c1.3218 0 2.5077.4545 3.4405 1.3455l2.5814-2.5814C13.4636.891 11.4264 0 9 0A8.9977 8.9977 0 0 0 .9573 4.9545l3.0068 2.3324C4.6718 5.1591 6.6559 3.5768 9 3.5768z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AppleLogoIcon({ size = 18, ...props }: BrandIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export const CheckIcon = withIconoirDefaults(Check);
export const CheckCircleIcon = withIconoirDefaults(CheckCircle);
export const CheckCircleSolidIcon = withIconoirDefaults(CheckCircleSolid);
export const BadgePercentIcon = withIconoirDefaults(PercentageCircle);
export const BookOpenIcon = withIconoirDefaults(OpenBook);
export const ChevronDownIcon = withIconoirDefaults(NavArrowDown);
export const ChevronRightIcon = withIconoirDefaults(NavArrowRight);
export const CircleHelpIcon = withIconoirDefaults(HelpCircle);
export const Clock3Icon = withIconoirDefaults(Clock);
export const CreditCardIcon = withIconoirDefaults(CreditCard);
export const EyeIcon = withIconoirDefaults(Eye);
export const EyeOffIcon = withIconoirDefaults(EyeClosed);
export const GlobeIcon = withIconoirDefaults(Globe);
export const HeartIcon = withIconoirDefaults(Heart);
export const InfoCircleIcon = withIconoirDefaults(InfoCircle);
export const InfoCircleSolidIcon = withIconoirDefaults(InfoCircleSolid);
export const LockKeyholeIcon = withIconoirDefaults(Lock);
export const MailIcon = withIconoirDefaults(Mail);
export const MailPlusIcon = withIconoirDefaults(MailIn);
export const MinusIcon = withIconoirDefaults(Minus);
export const NewspaperIcon = withIconoirDefaults(JournalPage);
export const NotebookTextIcon = withIconoirDefaults(Notes);
export const PackageOpenIcon = withIconoirDefaults(Package);
export const PlusIcon = withIconoirDefaults(Plus);
export const RulerIcon = withIconoirDefaults(Ruler);
export const SearchIcon = withIconoirDefaults(Search);
export const ShareIcon = withIconoirDefaults(ShareAndroid);
export const ShieldCheckIcon = withIconoirDefaults(ShieldCheck);
export const SmartphoneIcon = withIconoirDefaults(SmartphoneDevice);
export const ShoppingBagIcon = withIconoirDefaults(ShoppingBag);
export const StarIcon = withIconoirDefaults(Star);
export const TruckIcon = withIconoirDefaults(Truck);
export const UserIcon = withIconoirDefaults(User);
export const XIcon = withIconoirDefaults(Xmark);

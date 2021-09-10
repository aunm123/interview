/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

#import <RCTJPushModule.h>
#import <AVFoundation/AVFoundation.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, JPUSHRegisterDelegate, JPUSHGeofenceDelegate>

@property (nonatomic, strong) UIWindow * _Nullable window;
@property (nonatomic, strong) UIImageView * _Nullable loadingView ;
@property (nonatomic, strong, nullable) UIVisualEffectView *visualEffectView;
@property (nonatomic, strong) UIImageView * _Nullable backgroundView;

@end

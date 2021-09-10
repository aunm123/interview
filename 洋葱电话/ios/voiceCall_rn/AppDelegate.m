/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"



#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <React/RCTLog.h>
#import "CustomeRootView.h"

#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif

@import TwilioVoice;
@import UserNotifications;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  application.applicationIconBadgeNumber = 0;
  
  // JPush初始化配置
#if DEBUG
  [JPUSHService setupWithOption:launchOptions appKey:@"xxxxxxx"
                        channel:@"dev" apsForProduction:NO];
#else
  [JPUSHService setupWithOption:launchOptions appKey:@"xxxxx"
                        channel:@"pro" apsForProduction:YES];
#endif
  // APNS
  JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
  entity.types = JPAuthorizationOptionAlert|JPAuthorizationOptionBadge|JPAuthorizationOptionSound|JPAuthorizationOptionProvidesAppNotificationSettings;
  [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
  [launchOptions objectForKey: UIApplicationLaunchOptionsRemoteNotificationKey];
  // 自定义消息
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  [defaultCenter addObserver:self selector:@selector(networkDidReceiveMessage:) name:kJPFNetworkDidReceiveMessageNotification object:nil];
  // 地理围栏
  [JPUSHService registerLbsGeofenceDelegate:self withLaunchOptions:launchOptions];
  
  // ReactNative环境配置
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  CustomeRootView *rootView = [[CustomeRootView alloc] initWithBridge:bridge
                                                   moduleName:@"voiceCall_rn"
                                            initialProperties:nil];
  
  
  
  rootView.backgroundColor = [UIColor whiteColor];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  
  self.loadingView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"bg_loading_page_img.png"]];
  [self.loadingView setFrame:self.window.frame];
  [rootView addSubview:self.loadingView];
  
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(javaScriptDidLoad:)
                                               name:RCTJavaScriptDidLoadNotification
                                             object:bridge];
  
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [self requestNotificationPermission];
  
  RCTSetLogThreshold(RCTLogLevelInfo - 1);
  
//  for (NSString* family in [UIFont familyNames])  {
//    NSLog(@"%@", family);
//
//    for (NSString* name in [UIFont fontNamesForFamilyName: family])    {
//      NSLog(@"  %@", name);
//    }
//  }
  
  return YES;
}

- (void)javaScriptDidLoad:(NSNotification *)notification{

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [self.loadingView removeFromSuperview];
  });
}


- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)requestNotificationPermission {
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *settings) {
    if (settings.authorizationStatus == UNAuthorizationStatusDenied) {
      NSLog(@"User notification permission denied. Go to system settings to allow user notifications.");
    } else if (settings.authorizationStatus == UNAuthorizationStatusAuthorized) {
      NSLog(@"User notificaiton already authorized.");
    } else if (settings.authorizationStatus == UNAuthorizationStatusNotDetermined) {
      UNAuthorizationOptions options = UNAuthorizationOptionAlert;
      [center requestAuthorizationWithOptions:options completionHandler:^(BOOL granted, NSError *error) {
        if (error) {
          NSLog(@"Failed to request for user notification permission: %@", error);
        }
        
        if (granted) {
          NSLog(@"User notification permission granted.");
        } else {
          NSLog(@"User notification permission denied.");
        }
      }];
    }
  }];
}

- (void)dealloc{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

//- (void)applicationWillTerminate:(UIApplication*)application{
//  _backgroundView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"Bitmap.png"]];
//  _backgroundView.frame = self.window.frame;
//  [self.window addSubview:_backgroundView];
//}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
  _backgroundView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"bg_loading_page_img.png"]];
  _backgroundView.frame = self.window.frame;
  [self.window addSubview:_backgroundView];
}

-(void)applicationWillEnterForeground:(UIApplication *)application{
  application.applicationIconBadgeNumber = 0;
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  if (_backgroundView != nil) {
    [_backgroundView removeFromSuperview];
    _backgroundView = nil;
  }
  application.applicationIconBadgeNumber = 0;
}

//- (void)applicationWillResignActive:(UIApplication *)application {
//  UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];
//  self.visualEffectView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
//  self.visualEffectView.alpha = 0;
//  self.visualEffectView.frame = self.window.frame;
//  [self.window addSubview:self.visualEffectView];
//  [UIView animateWithDuration:0.5 animations:^{
//    self.visualEffectView.alpha = 1;
//  }];
//
//}
//
//- (void)applicationDidBecomeActive:(UIApplication *)application {
//  [UIView animateWithDuration:0.5 animations:^{
//    self.visualEffectView.alpha = 0;
//  } completion:^(BOOL finished) {
//    [self.visualEffectView removeFromSuperview];
//  }];
//}


//************************************************JPush start************************************************

//注册 APNS 成功并上报 DeviceToken
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [JPUSHService registerDeviceToken:deviceToken];
}

//iOS 7 APNS
- (void)application:(UIApplication *)application didReceiveRemoteNotification:  (NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  // iOS 10 以下 Required
  NSLog(@"iOS 7 APNS");
  [JPUSHService handleRemoteNotification:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  completionHandler(UIBackgroundFetchResultNewData);
}

//ios 4 本地通知 todo
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification{
  NSDictionary *userInfo =  notification.userInfo;
  NSLog(@"iOS 4 本地通知");
  [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_EVENT object:userInfo];
}

//iOS 10 前台收到消息
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center  willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 前台收到消息");
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  else {
    // 本地通知 todo
    NSLog(@"iOS 10 本地通知 前台收到消息");
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_EVENT object:userInfo];
  }
  completionHandler(UNNotificationPresentationOptionSound);// 需要执行这个方法，选择是否提醒用户，有 Badge、Sound、Alert 三种类型可以选择设置
}

//iOS 10 消息事件回调
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler: (void (^)(void))completionHandler {
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    NSLog(@"iOS 10 APNS 消息事件回调");
    // Apns
    [JPUSHService handleRemoteNotification:userInfo];
    // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._notificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_OPENED_EVENT object:userInfo];
  }
  else {
    // 本地通知 todo
    NSLog(@"iOS 10 本地通知 消息事件回调");
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_EVENT object:userInfo];
  }
  // 系统要求执行这个方法
  completionHandler();
}

//自定义消息
- (void)networkDidReceiveMessage:(NSNotification *)notification {
  NSDictionary * userInfo = [notification userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:J_CUSTOM_NOTIFICATION_EVENT object:userInfo];
}

//************************************************JPush end************************************************


- (void)jpushGeofenceIdentifer:(NSString *)geofenceId didEnterRegion:(NSDictionary *)userInfo error:(NSError *)error {
  RCTLogInfo(@"jpushGeofenceIdentifer didEnterRegion");
}

- (void)jpushGeofenceIdentifer:(NSString *)geofenceId didExitRegion:(NSDictionary *)userInfo error:(NSError *)error {
  RCTLogInfo(@"jpushGeofenceIdentifer didExitRegion");
}

@end

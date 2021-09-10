//
//  CustomeRootVC.m
//  voiceCall_rn
//
//  Created by tim on 11/2/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CustomeRootView.h"

@implementation CustomeRootView


- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event{
    NSLog(@"%s",__func__);
    return [super hitTest:point withEvent:event];
}

@end

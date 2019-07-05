////////////////////////////////////////////////////////////////////////////////
// tarumae engine
// https://tarumae.tech
//
// Copyright(c) 2016-2019 BULB Corp., Jingwood, all rights reserved
////////////////////////////////////////////////////////////////////////////////

precision mediump float;

uniform sampler2D texture;
varying vec2 texcoord;

#pragma glslify: import("./grayscale.glsl")

void main(void) {
	vec3 rgb = texture2D(texture, texcoord).rgb;

	gl_FragColor = vec4(grayscale(rgb), 1.0);
}